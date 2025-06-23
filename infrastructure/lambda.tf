terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "transcribelo"
}

variable "assembly_ai_key" {
  description = "AssemblyAI API key"
  type        = string
  sensitive   = true
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "private_key" {
  description = "Google Cloud Service Account private key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "client_email" {
  description = "Google Cloud Service Account client email"
  type        = string
  default     = ""
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
  default     = ""
}

# IAM Role para Lambda
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-api"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_function" "speech_to_text_api" {
  filename      = "../backend/lambda-unified.zip"
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "dist/lambda.handler"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512

  source_code_hash = filebase64sha256("../backend/lambda-unified.zip")

  environment {
    variables = {
      NODE_ENV                = "production"
      ASSEMBLY_AI_KEY         = var.assembly_ai_key
      GOOGLE_CLOUD_PROJECT_ID = var.project_id
      OPENAI_API_KEY          = var.openai_api_key
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.lambda_logs,
  ]

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# HTTP API Gateway (v2) - Mejor para archivos binarios
resource "aws_apigatewayv2_api" "speech_to_text" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token"]
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    max_age           = 86400
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id = aws_apigatewayv2_api.speech_to_text.id

  integration_uri    = aws_lambda_function.speech_to_text_api.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id = aws_apigatewayv2_api.speech_to_text.id

  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "root" {
  api_id = aws_apigatewayv2_api.speech_to_text.id

  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "speech_to_text" {
  api_id = aws_apigatewayv2_api.speech_to_text.id

  name        = var.environment
  auto_deploy = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.speech_to_text_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.speech_to_text.execution_arn}/*/*"
}

output "api_gateway_url" {
  description = "URL del API Gateway"
  value       = aws_apigatewayv2_stage.speech_to_text.invoke_url
}
