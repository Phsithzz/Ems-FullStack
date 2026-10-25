package net.javaguides.ems.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class LedgerImbalanceException extends RuntimeException {
    public LedgerImbalanceException(String message) {
        super(message);
    }
}
