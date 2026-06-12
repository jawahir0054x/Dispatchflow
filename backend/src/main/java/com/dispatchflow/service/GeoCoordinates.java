package com.dispatchflow.service;

import lombok.Getter;

@Getter
public final class GeoCoordinates {

    private final double latitude;
    private final double longitude;
    private final String displayName;

    public GeoCoordinates(double latitude, double longitude, String displayName) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.displayName = displayName;
    }
}
