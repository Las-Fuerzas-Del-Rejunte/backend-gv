import "reflect-metadata";
import { CreateClientDto } from 'src/modules/clients/dto/create-client.dto';
import { UpdateClientDto } from 'src/modules/clients/dto/update-client.dto';
import { validate } from 'class-validator';

describe('CreateClientDto', () => {
  it('should be defined', () => {
    expect(new CreateClientDto()).toBeDefined();
  });
});

describe('UpdateClientDto', () => {
  it('should be defined', () => {
    expect(new UpdateClientDto()).toBeDefined();
  });
});
