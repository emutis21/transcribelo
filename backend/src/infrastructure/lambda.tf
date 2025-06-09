# infrastructure/lambda.tf
resource "aws_lambda_function" "speech_to_text_api" {
  filename         = "lambda-deployment.zip"
  function_name    = "speech-to-text-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "dist/lambda.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512

  environment {
    variables = {
      NODE_ENV = "production"
      ASSEMBLY_AI_KEY = var.assembly_ai_key
      GOOGLE_CLOUD_PROJECT_ID = var.google_project_id
    }
  }
}

variable "assembly_ai_key" {
  description = "AssemblyAI API key"
  type        = string
}

variable "google_project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

resource "aws_api_gateway_rest_api" "speech_to_text" {
  name = "speech-to-text-api"
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.speech_to_text_api.function_name
  principal     = "apigateway.amazonaws.com"
}