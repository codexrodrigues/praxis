package com.example.praxis.sample;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.example.praxis.sample", "com.example.praxis.hr"})
public class SamplePraxisApp {

    public static void main(String[] args) {
        SpringApplication.run(SamplePraxisApp.class, args);
    }

}
