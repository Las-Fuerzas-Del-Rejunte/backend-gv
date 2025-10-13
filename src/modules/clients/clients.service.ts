import { Injectable } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  findAll(): Promise<Client[]> {
    return this.clientsRepository.findAll();
  }

  findOne(id: string): Promise<Client> {
    return this.clientsRepository.findById(id);
  }

  create(payload: CreateClientDto): Promise<Client> {
    return this.clientsRepository.create(payload);
  }

  update(id: string, payload: UpdateClientDto): Promise<Client> {
    return this.clientsRepository.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.clientsRepository.remove(id);
  }
}
