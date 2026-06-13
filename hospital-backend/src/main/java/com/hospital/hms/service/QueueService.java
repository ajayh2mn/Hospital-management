package com.hospital.hms.service;

import com.hospital.hms.entity.Queue;
import com.hospital.hms.entity.QueueStatus;
import com.hospital.hms.entity.Staff;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.QueueRepository;
import com.hospital.hms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueRepository queueRepository;
    private final StaffRepository staffRepository;

    public List<Queue> getDoctorQueue(Long doctorId, LocalDate date) {
        Staff doctor = staffRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        return queueRepository.findByDoctorAndQueueDateOrderByTokenNumber(doctor, date);
    }

    public List<Queue> getTodayWaitingQueue() {
        return queueRepository.findByQueueDateAndStatus(LocalDate.now(), QueueStatus.WAITING);
    }

    @Transactional
    public Queue callNextPatient(Long queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));
        queue.setStatus(QueueStatus.CALLED);
        queue.setCalledAt(LocalTime.now());
        return queueRepository.save(queue);
    }

    @Transactional
    public Queue completeConsultation(Long queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));
        queue.setStatus(QueueStatus.COMPLETED);
        queue.setCompletedAt(LocalTime.now());
        return queueRepository.save(queue);
    }

    @Transactional
    public Queue skipPatient(Long queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));
        queue.setStatus(QueueStatus.SKIPPED);
        return queueRepository.save(queue);
    }
}
