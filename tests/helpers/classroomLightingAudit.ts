import ts from "typescript";

/** Remove only the explicitly authorized lighting integration sites. All camera,
 * pose, renderer settings, narrative, geometry and audio code remains compared. */
export function withoutLightingHooks(text: string) {
  const file = ts.createSourceFile(
    "world.ts",
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const result = ts.transform(file, [
    (context) => (root) => {
      const isRig = (node: ts.Node): boolean =>
        ts.isPropertyAccessExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ThisKeyword &&
        node.name.text === "classroomLighting";
      const visit: ts.Visitor = (node) => {
        if (
          ts.isImportDeclaration(node) &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          ["./ClassroomLighting", "./ClassroomPerformance"].includes(
            node.moduleSpecifier.text,
          )
        )
          return undefined;
        // Later authorized classroom-only performance hook; all original pose code stays guarded.
        if (
          ts.isIfStatement(node) &&
          node.expression.getText(file) === "!this.ripple" &&
          ts.isExpressionStatement(node.thenStatement) &&
          ts.isCallExpression(node.thenStatement.expression) &&
          ts.isIdentifier(node.thenStatement.expression.expression) &&
          node.thenStatement.expression.expression.text ===
            "applyClassroomPerformance"
        )
          return undefined;
        if (
          ts.isPropertyDeclaration(node) &&
          ts.isIdentifier(node.name) &&
          node.name.text === "classroomLighting"
        )
          return undefined;
        if (ts.isExpressionStatement(node)) {
          const expression = node.expression;
          if (
            ts.isBinaryExpression(expression) &&
            isRig(expression.left) &&
            expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            ts.isNewExpression(expression.right) &&
            expression.right.expression.getText(file) === "ClassroomLighting"
          )
            return undefined;
          if (
            ts.isCallExpression(expression) &&
            ts.isPropertyAccessExpression(expression.expression) &&
            isRig(expression.expression.expression) &&
            ["update", "dispose"].includes(expression.expression.name.text)
          )
            return undefined;
        }
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(root, visit) as ts.SourceFile;
    },
  ]);
  const output = ts
    .createPrinter({ removeComments: true })
    .printFile(result.transformed[0]);
  result.dispose();
  return output;
}
