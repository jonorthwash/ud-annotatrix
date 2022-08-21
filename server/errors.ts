export class UDAnnotatrixError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, UDAnnotatrixError.prototype);
  }
}

export class ConfigError extends UDAnnotatrixError {
  constructor(message: string) {
    console.log("ConfigError:", message);
    super(message);

    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

export class DBError extends UDAnnotatrixError {
  constructor(message: string) {
    console.log("DBError:", message);
    super(message);

    Object.setPrototypeOf(this, DBError.prototype);
  }
}

export class UploadError extends UDAnnotatrixError {
  constructor(message: string) {
    console.log("UploadError:", message);
    super(message);

    Object.setPrototypeOf(this, UploadError.prototype);
  }
}

export class SocketError extends UDAnnotatrixError {
  constructor(message: string) {
    console.log("SocketError:", message);
    super(message);

    Object.setPrototypeOf(this, SocketError.prototype);
  }
}
