package com.mageddo.config;

import io.micronaut.context.ApplicationContext;

public final class ApplicationContextUtils {

  private static ApplicationContext context;

  private ApplicationContextUtils() {
  }

  public static ApplicationContext context() {
    return context;
  }

  public static void context(ApplicationContext context) {
    ApplicationContextUtils.context = context;
  }
}
