import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "RBAC API",
    description: "RBAC API 文档",
  },
  host: "localhost:8899",
  basePath: "/api",
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  }
};
const outputFile = "src/swagger/swagger-output.json"; // 输出的 JSON 文件
const endpointsFiles = ["src/routes/*.ts"]; // 要扫描的路由文件

(async () => {
  const result = await swaggerAutogen({
    openapi: "3.0.0",
  })(outputFile, endpointsFiles, doc);
  if (result as any) {
    console.log("Swagger doc generated!");
  } else {
    console.error("Failed to generate Swagger doc.");
  }
})();
