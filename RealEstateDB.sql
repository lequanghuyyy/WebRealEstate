CREATE DATABASE RealEstateDB;
USE RealEstateDB;
CREATE TABLE Users (
    id           VARCHAR(255) PRIMARY KEY, 
    username     VARCHAR(255) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(255),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Listings (
    id           VARCHAR(255) PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    address      TEXT NOT NULL,
    city         VARCHAR(100) NOT NULL,
    price        DECIMAL(12,2) NOT NULL,
    area         DECIMAL(10,2), -- Diện tích (m²)
    bedrooms     INT,
    bathrooms    INT,
    type         ENUM('SALE', 'RENT') NOT NULL, -- Bán hoặc Cho thuê
    status       ENUM('AVAILABLE', 'SOLD', 'RENTED') DEFAULT 'AVAILABLE',
    owner_id     VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
);
CREATE TABLE ListingImages (
    id          VARCHAR(255) PRIMARY KEY,
    listing_id  VARCHAR(255) NOT NULL,
    image_url   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(id) ON DELETE CASCADE
);
CREATE TABLE ContactRequests (
    id         VARCHAR(255) PRIMARY KEY,
    listing_id  VARCHAR(255) NOT NULL,
    user_id     VARCHAR(255) NOT NULL,
    message     TEXT,
    status      ENUM('PENDING', 'RESPONDED', 'CLOSED') DEFAULT 'PENDING',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
CREATE TABLE Transactions (
    id           VARCHAR(255) PRIMARY KEY,
    listing_id   VARCHAR(255) NOT NULL,
    buyer_id     VARCHAR(255), -- Người mua/thuê
    agent_id     VARCHAR(255), -- Môi giới
    amount       DECIMAL(12,2) NOT NULL,
    status       ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    transaction_type ENUM('SALE', 'RENT') NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES Users(id) ON DELETE SET NULL
);
CREATE TABLE Payments (
    id             VARCHAR(255) PRIMARY KEY,
    transaction_id  VARCHAR(255) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    payment_method  ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'CASH') NOT NULL,
    status          ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(id) ON DELETE CASCADE
);
CREATE TABLE Reviews (
    id          VARCHAR(255) PRIMARY KEY,
    listing_id  VARCHAR(255) NOT NULL,
    user_id     VARCHAR(255) NOT NULL,
    rating      INT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
