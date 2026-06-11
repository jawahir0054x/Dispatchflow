package com.dispatchflow.security;

public final class Authorities {

    public static final String ADMIN = "ADMIN";
    public static final String DISPATCHER = "DISPATCHER";

    public static final String HAS_ADMIN = "hasRole('ADMIN')";
    public static final String HAS_DISPATCHER = "hasRole('DISPATCHER')";
    public static final String HAS_ADMIN_OR_DISPATCHER = "hasAnyRole('ADMIN', 'DISPATCHER')";

    private Authorities() {
    }
}
