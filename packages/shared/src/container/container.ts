import 'reflect-metadata';
import { Container } from 'inversify';
import { SHARED_TYPES } from './types';
import { ILogger, IErrorHandler, IEncryption, ISecurity, IConfigManager } from './interfaces';
import { Logger } from '../logging/logger';
import { ErrorHandler } from '../errors/error-handler';
import { EncryptionService } from '../encryption/encryption-service';
import { SecurityService } from '../security/security-service';
import { ConfigManager } from '../config/config-manager';

const sharedContainer = new Container();

// Core Services
sharedContainer.bind<ILogger>(SHARED_TYPES.Logger).to(Logger).inSingletonScope();
sharedContainer.bind<IErrorHandler>(SHARED_TYPES.ErrorHandler).to(ErrorHandler).inSingletonScope();
sharedContainer.bind<IEncryption>(SHARED_TYPES.Encryption).to(EncryptionService).inSingletonScope();
sharedContainer.bind<ISecurity>(SHARED_TYPES.Security).to(SecurityService).inSingletonScope();
sharedContainer.bind<IConfigManager>(SHARED_TYPES.ConfigManager).to(ConfigManager).inSingletonScope();

export { sharedContainer };
