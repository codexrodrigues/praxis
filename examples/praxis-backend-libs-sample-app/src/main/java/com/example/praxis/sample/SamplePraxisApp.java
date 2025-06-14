package com.example.praxis.sample;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.praxis"})
@EntityScan(basePackages = {"com.example.praxis.hr.entity"})
@EnableJpaRepositories(basePackages = {"com.example.praxis.hr.repository"})
public class SamplePraxisApp {

    public static void main(String[] args) {
        SpringApplication.run(SamplePraxisApp.class, args);
    }
}
