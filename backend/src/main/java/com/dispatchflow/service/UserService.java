package com.dispatchflow.service;

import com.dispatchflow.dto.request.UserRequest;
import com.dispatchflow.dto.response.PageResponse;
import com.dispatchflow.dto.response.UserResponse;
import com.dispatchflow.entity.User;
import com.dispatchflow.enums.Role;
import com.dispatchflow.exception.DuplicateResourceException;
import com.dispatchflow.exception.ForbiddenException;
import com.dispatchflow.exception.ResourceNotFoundException;
import com.dispatchflow.repository.UserRepository;
import com.dispatchflow.util.PageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        return PageMapper.toPageResponse(userRepository.findAll(pageable), this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findUserOrThrow(id));
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Password is required when creating a user");
        }

        validateUniqueEmail(request.getEmail(), null);

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(request.getRole())
                .build();

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUserOrThrow(id);
        validateUniqueEmail(request.getEmail(), id);

        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(request.getRole());

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        String currentEmail = getCurrentUserEmail();

        if (currentEmail != null && currentEmail.equalsIgnoreCase(user.getEmail())) {
            throw new ForbiddenException("You cannot delete your own account");
        }

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new ForbiddenException("Cannot delete the last admin user");
            }
        }

        userRepository.delete(user);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private void validateUniqueEmail(String email, Long excludeId) {
        String normalized = email.toLowerCase().trim();
        boolean exists = excludeId == null
                ? userRepository.existsByEmail(normalized)
                : userRepository.existsByEmailAndIdNot(normalized, excludeId);

        if (exists) {
            throw new DuplicateResourceException("Email is already registered: " + normalized);
        }
    }

    private String getCurrentUserEmail() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails userDetails)) {
            return null;
        }
        return userDetails.getUsername();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
