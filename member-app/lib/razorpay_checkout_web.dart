import 'dart:js_interop';

@JS('openRazorpayCheckout')
external bool _openRazorpayJs(
  JSString optionsJson,
  JSFunction onSuccess,
  JSFunction onDismiss,
);

void openRazorpayWebCheckout({
  required String optionsJson,
  required Function(String paymentId, String orderId, String signature) onSuccess,
  required Function() onDismiss,
  required Function() onFallback,
}) {
  try {
    final successCallback = ((JSString paymentId, JSString orderId, JSString signature) {
      onSuccess(paymentId.toDart, orderId.toDart, signature.toDart);
    }).toJS;

    final dismissCallback = (() {
      onDismiss();
    }).toJS;

    final opened = _openRazorpayJs(
      optionsJson.toJS,
      successCallback,
      dismissCallback,
    );

    if (!opened) {
      onFallback();
    }
  } catch (e) {
    onFallback();
  }
}
