package com.example.praxis.sample.controller;

import com.example.praxis.common.config.ApiRouteDefinitions;
import com.example.praxis.sample.dto.UserDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRouteDefinitions.USERS_PATH)
@Tag(name = ApiRouteDefinitions.USERS_TAG, description = "Operations related to Users")
public class UserController {

    @PostMapping
    public UserDTO createUser(@RequestBody UserDTO user) {
        // In a real application, you would typically save the user to a database
        // and then return the saved user, possibly with an ID.
        // For this example, we just return the received DTO.
        return user;
    }
}
