package net.javaguides.ems.services;

import java.util.function.Supplier;

public interface IdempotencyService {

    /**
     * Executes business logic with idempotency protection.
     * If idempotencyKey is null/empty, executes logic directly without deduplication.
     * If key is already RESOLVED, returns cached response.
     * If key is PROCESSING, throws IdempotencyConflictException.
     *
     * @param idempotencyKey unique client-supplied idempotency key (e.g. UUID)
     * @param endpoint endpoint path for auditing
     * @param responseType class type of response
     * @param execution the actual business logic lambda
     * @return response object
     */
    <T> T execute(String idempotencyKey, String endpoint, Class<T> responseType, Supplier<T> execution);
}
