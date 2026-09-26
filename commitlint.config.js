export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-length": [2, "always", 400],
    "scope-enum": [1, "always", ["web", "bot", "qr", "ui", "shared", "env", "docker", "deps"]],
  },
};
