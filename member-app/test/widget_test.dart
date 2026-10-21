import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:member_app/main.dart';

void main() {
  testWidgets('Library member app loads explore catalog screen', (WidgetTester tester) async {
    await tester.pumpWidget(const LibraryMemberApp());
    await tester.pumpAndSettle();

    // Verify title and navigation items render
    expect(find.text('Central Library'), findsOneWidget);
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Reservations'), findsOneWidget);
    expect(find.text('Library Card'), findsOneWidget);
    expect(find.text('Loans & Fines'), findsOneWidget);
  });

  testWidgets('Loans and Fines screen allows Cash or Online payment', (WidgetTester tester) async {
    await tester.pumpWidget(const LibraryMemberApp());
    await tester.pumpAndSettle();

    // Navigate to Loans & Fines tab
    await tester.tap(find.text('Loans & Fines'));
    await tester.pumpAndSettle();

    // Verify Loans screen starts with Active Library Loans
    expect(find.text('Active Library Loans'), findsOneWidget);
    expect(find.text('Pay Fine (Cash / Online)'), findsOneWidget);

    // Tap Pay Fine button to open payment options modal
    await tester.tap(find.text('Pay Fine (Cash / Online)'));
    await tester.pumpAndSettle();

    // Verify Dual Payment Options exist
    expect(find.text('Choose Payment Method'), findsOneWidget);
    expect(find.text('Pay Online (Razorpay)'), findsOneWidget);
    expect(find.text('Pay Cash at Counter'), findsOneWidget);
    expect(find.text('Generate Cash Slip Voucher'), findsOneWidget);

    // Tap "Generate Cash Slip Voucher" to test cash route
    await tester.tap(find.text('Generate Cash Slip Voucher'));
    await tester.pumpAndSettle();

    // Verify Cash Voucher Modal renders with QR and Cash Slip Code
    expect(find.text('Counter Cash Voucher'), findsOneWidget);
    expect(find.textContaining('CASH-'), findsWidgets);
    expect(find.text('Simulate Counter Cash Handover'), findsOneWidget);

    // Simulate Counter Cash Handover
    await tester.tap(find.text('Simulate Counter Cash Handover'));
    await tester.pumpAndSettle();

    // Verify fine is settled and receipt appears
    expect(find.text('Settled Fine Receipts'), findsOneWidget);
    expect(find.text('CASH'), findsOneWidget);
  });

  testWidgets('Reserve book offers dual payment options (Online Razorpay vs Cash at Counter)', (WidgetTester tester) async {
    await tester.pumpWidget(const LibraryMemberApp());
    await tester.pumpAndSettle();

    // In Explore tab, tap Reserve (24h)
    final reserveButtons = find.text('Reserve (24h)');
    expect(reserveButtons, findsWidgets);
    await tester.tap(reserveButtons.first);
    await tester.pumpAndSettle();

    // Verify Reserve Modal with Dual Payment Options appears
    expect(find.text('Reserve Book (24h Hold)'), findsOneWidget);
    expect(find.textContaining('holding deposit of ₹20.00'), findsOneWidget);
    expect(find.text('Pay Online via Razorpay'), findsOneWidget);
    expect(find.text('Pay Cash at Counter on Pickup'), findsOneWidget);
    expect(find.text('Reserve & Pay Cash on Pickup'), findsOneWidget);

    // Tap Cash on Pickup
    await tester.tap(find.text('Reserve & Pay Cash on Pickup'));
    await tester.pumpAndSettle();

    // Verify navigated to Reservations tab and reservation shows Cash pickup badge
    expect(find.text('PICKUP RESERVATION'), findsWidgets);
    expect(find.textContaining('Deposit: PAY CASH AT DESK'), findsWidgets);
  });

  testWidgets('Member login screen authenticates patron and allows sign out', (WidgetTester tester) async {
    // Start app with startLoggedIn: false
    await tester.pumpWidget(const LibraryMemberApp(startLoggedIn: false));
    await tester.pumpAndSettle();

    // Verify Member Login Screen elements
    expect(find.text('Central Library'), findsOneWidget);
    expect(find.text('Member Portal & Digital Library Card'), findsOneWidget);
    expect(find.text('Sign In to Member Portal'), findsOneWidget);
    expect(find.text('Alex Rivera'), findsOneWidget);

    // Tap quick demo login as Alex Rivera
    await tester.tap(find.text('Alex Rivera'));
    await tester.pumpAndSettle();

    // Verify logged in to Main Navigation Screen
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Library Card'), findsOneWidget);

    // Tap Sign Out icon in AppBar
    await tester.tap(find.byTooltip('Sign Out'));
    await tester.pumpAndSettle();

    // Verify back to Member Login Screen
    expect(find.text('Member Portal & Digital Library Card'), findsOneWidget);
    expect(find.text('Sign In to Member Portal'), findsOneWidget);
  });

  testWidgets('Library Card and Loans & Fines screens render flexibly on narrow screen without overflow', (WidgetTester tester) async {
    // Simulate narrow 320x640 mobile screen
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const LibraryMemberApp(startLoggedIn: true));
    await tester.pumpAndSettle();

    // 1. Visit Library Card tab
    await tester.tap(find.text('Library Card'));
    await tester.pumpAndSettle();

    expect(find.text('CENTRAL UNIVERSITY LIBRARY'), findsOneWidget);
    expect(find.text('ACTIVE PATRON'), findsOneWidget);
    expect(find.textContaining('Reg No:'), findsOneWidget);

    // 2. Visit Loans & Fines tab
    await tester.tap(find.text('Loans & Fines'));
    await tester.pumpAndSettle();

    expect(find.text('Active Library Loans'), findsOneWidget);
    expect(find.text('Pay Fine (Cash / Online)'), findsOneWidget);

    // Open Pay Fine modal on narrow screen to ensure dialog is also overflow-safe
    await tester.tap(find.text('Pay Fine (Cash / Online)'));
    await tester.pumpAndSettle();
    expect(find.text('Choose Payment Method'), findsOneWidget);
    expect(find.text('Pay Online (Razorpay)'), findsOneWidget);
    expect(find.text('Pay Cash at Counter'), findsOneWidget);
  });
}
