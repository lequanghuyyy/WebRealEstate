package realestate.webrealestatepaymentservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.BaseResponse;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;
import realestate.webrealestatepaymentservice.dto.response.ResponseFactory;
import realestate.webrealestatepaymentservice.service.PaymentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/payment")
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<BaseResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseFactory.ok(paymentService.processPayment(request));
    }

    @GetMapping("/find/{transactionId}")
    public ResponseEntity<BaseResponse<PaymentResponse>> getPaymentByTransactionId(@PathVariable String transactionId) {
        return ResponseFactory.ok(paymentService.getPaymentByTransactionId(transactionId));
    }
}
