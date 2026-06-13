
-- Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'company_admin', 'hr', 'manager', 'employee');
CREATE TYPE public.tenant_type AS ENUM ('hospital', 'education', 'corporate');
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.leave_type AS ENUM ('casual', 'sick', 'earned', 'unpaid', 'maternity');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'on_leave');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled');

-- Tenants
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.tenant_type NOT NULL DEFAULT 'hospital',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, tenant_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Get current tenant for a user
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Auto-create profile + assign default role + create demo tenant on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Create a personal tenant for the new user (demo seed)
  INSERT INTO public.tenants (name, type)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'org_name', 'My Organization'), 'hospital')
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.profiles (id, tenant_id, full_name, email)
  VALUES (
    NEW.id,
    v_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  -- First user of a tenant becomes company_admin
  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (NEW.id, v_tenant_id, 'company_admin');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "View own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "View tenant profiles" ON public.profiles FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Tenants policies
CREATE POLICY "View own tenant" ON public.tenants FOR SELECT TO authenticated USING (id = public.current_tenant_id());
CREATE POLICY "Admins update tenant" ON public.tenants FOR UPDATE TO authenticated
  USING (id = public.current_tenant_id() AND (public.has_role(auth.uid(),'company_admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (id = public.current_tenant_id());

-- User roles policies
CREATE POLICY "View tenant roles" ON public.user_roles FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id() OR user_id = auth.uid());

-- Departments
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant view departments" ON public.departments FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "HR manage departments" ON public.departments FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() AND (public.has_role(auth.uid(),'hr') OR public.has_role(auth.uid(),'company_admin')))
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  designation text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  base_salary numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Tenant view employees" ON public.employees FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "HR manage employees" ON public.employees FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() AND (public.has_role(auth.uid(),'hr') OR public.has_role(auth.uid(),'company_admin')))
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Attendance
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in timestamptz,
  check_out timestamptz,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant view attendance" ON public.attendance FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Insert own attendance" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());
CREATE POLICY "Update tenant attendance" ON public.attendance FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- Leave requests
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type public.leave_type NOT NULL DEFAULT 'casual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status public.leave_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant view leaves" ON public.leave_requests FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Create leave request" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (tenant_id = public.current_tenant_id());
CREATE POLICY "Approve leave" ON public.leave_requests FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND (public.has_role(auth.uid(),'hr') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'company_admin')));

-- Payroll runs
CREATE TABLE public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_month int NOT NULL,
  period_year int NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  gross numeric(12,2) NOT NULL DEFAULT 0,
  deductions numeric(12,2) NOT NULL DEFAULT 0,
  net numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_runs TO authenticated;
GRANT ALL ON public.payroll_runs TO service_role;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant view payroll" ON public.payroll_runs FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "HR manage payroll" ON public.payroll_runs FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() AND (public.has_role(auth.uid(),'hr') OR public.has_role(auth.uid(),'company_admin')))
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Hospital: appointments + queue
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_phone text,
  doctor_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  notes text,
  token_number int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant view appointments" ON public.appointments FOR SELECT TO authenticated USING (tenant_id = public.current_tenant_id());
CREATE POLICY "Staff manage appointments" ON public.appointments FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());
