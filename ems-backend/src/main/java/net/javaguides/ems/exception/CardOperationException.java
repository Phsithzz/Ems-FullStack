package net.javaguides.ems.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CardOperationException extends RuntimeException {
    public CardOperationException(String message) {
        super(message);
    }
}
