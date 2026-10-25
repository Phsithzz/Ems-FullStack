package net.javaguides.ems.services;

import net.javaguides.ems.dto.*;
import net.javaguides.ems.entity.CardTransaction;

import java.util.List;

public interface CorporateCardService {

    List<CorporateCardDto> getAllCards();

    CorporateCardDto getCardById(Long id);

    CorporateCardDto createCard(CreateCardRequestDto dto);

    CorporateCardDto updateCardStatus(Long cardId, String status);

    /**
     * Real-time card payment authorization (Hold).
     * Verifies limits, status, and holds funds in the backing wallet.
     */
    CardAuthorizeResponseDto authorizeTransaction(Long cardId, CardAuthorizeRequestDto dto, String idempotencyKey);

    /**
     * Settles an authorized card transaction (Capture).
     */
    CardAuthorizeResponseDto settleTransaction(Long transactionId);

    List<CardTransaction> getCardTransactions(Long cardId);
}
