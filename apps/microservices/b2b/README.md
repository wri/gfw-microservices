# Clean Architecture for B2B Microservice

This document provides an overview of the Clean Architecture implemented for the "b2b" microservice using NestJS and TypeScript. The architecture consists of three layers: application, domain, and infrastructure. Additionally, the code is organized into units of business (Invitation, Connection) and there is a "shared" folder where is contain all the logic that needs to be required from the units of business.

<img src="clean.png" alt="Texto alternativo de la imagen" width="300" align="middle">

## Application Layer

The application layer is responsible for the use cases and business logic of the microservice. It contains the application services that orchestrate the interaction between the domain and infrastructure layers. The application layer is independent of the framework or infrastructure and can be easily replaced or tested.

### Invitation

- `invitation.use-case.ts`: Contains the use cases related to Invitations.
- `invitation.dto.ts`: Contains the DTOs related to Invitations.

### Connection

- `connection.use-case.ts`: Contains the use cases related to Connections.
- `connection.dto.ts`: Contains the DTOs related to Connections.

## Domain Layer

The domain layer contains the business logic of the microservice. It is where the entities, value objects, and business rules are defined. The domain layer is independent of the infrastructure and application layers.

### Invitation

- `invitation.entity.ts`: Contains the Invitation entity definition.
- `invitation.repository.ts`: Contains the interface for the Invitation repository.

### Connection

- `connection.entity.ts`: Contains the Connection entity definition.
- `connection.repository.ts`: Contains the interface for the Connection repository.

## Infrastructure Layer

The infrastructure layer contains the implementation details of the microservice, such as databases, external APIs, and other infrastructure-related concerns. It is responsible for interacting with the outside world and providing concrete implementations for the application and domain layers.

### Invitation

- `invitation.repository.impl.ts`: Contains the implementation of the Invitation repository using a database.
- `invitation.controller.ts`: Contains the NestJS controllers related to Invitations.

### Connection

- `connection.repository.impl.ts`: Contains the implementation of the Connection repository using a database.
- `connection.controller.ts`: Contains the NestJS controllers related to Connections.

## Shared Layer

The shared layer contains general things that are called from the other units of business, such as common utilities, configurations, and constants.
