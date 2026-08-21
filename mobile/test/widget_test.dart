import 'package:flutter_test/flutter_test.dart';

import 'package:ecohome_mobile/main.dart';

void main() {
  testWidgets('Muestra la pantalla de login', (WidgetTester tester) async {
    await tester.pumpWidget(const EcoHomeApp());
    await tester.pump();

    expect(find.text('EcoHome Store'), findsOneWidget);
    expect(find.text('Ingresar'), findsOneWidget);
  });
}
