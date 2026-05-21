terraform {
  backend "s3" {
    bucket  = "yashjagani-tfstate-bucket"
    key     = "portfolio-frontend/terraform.tfstate"
    region  = "eu-west-2"
    profile = "yash"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}