package realestate.webrealestatepaymentservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import realestate.webrealestatepaymentservice.constant.PaymentStatus;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;
import realestate.webrealestatepaymentservice.dto.request.PaymentRequest;
import realestate.webrealestatepaymentservice.dto.response.BaseResponse;
import realestate.webrealestatepaymentservice.dto.response.PaymentResponse;
import realestate.webrealestatepaymentservice.dto.response.ResponseFactory;
import realestate.webrealestatepaymentservice.service.PaymentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/payments")
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
    @GetMapping("/find/{agentId}/{page}")
    public ResponseEntity<BaseResponse<Page<PaymentResponse>>> getAllPayments(@PathVariable String agentId, @PathVariable int page) {
        return ResponseFactory.ok(paymentService.getAllPayments(agentId, page));
    }
    @GetMapping("/commission")
    public ResponseEntity<BaseResponse<String>> calculateCommissionFee() {
        return ResponseFactory.ok(paymentService.calculateCommissionFee().toString());
    }
    @GetMapping("/{page}")
    public ResponseEntity<BaseResponse<Page<PaymentResponse>>> getAllPayments(@PathVariable int page) {
        return ResponseFactory.ok(paymentService.getAllPayments(page));
    }
    @GetMapping("/commission/{transactionStyle}")
    public ResponseEntity<BaseResponse<String>> calculateCommissionFee(@PathVariable String transactionStyle) {
        TransactionStyle style = TransactionStyle.valueOf(transactionStyle.toUpperCase());
        return ResponseFactory.ok(paymentService.calculateCommissionFee(style).toString());
    }
    @PutMapping("/update/{paymentId}/{paymentStatus}")
    public ResponseEntity<BaseResponse<PaymentResponse>> updatePaymentStatus(@PathVariable String paymentId, @PathVariable String paymentStatus) {

        PaymentStatus status = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        return ResponseFactory.ok(paymentService.updateStatus(paymentId, status));
    }
}
