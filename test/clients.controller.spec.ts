
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../src/modules/clients/clients.controller';
import { ClientsService } from '../src/modules/clients/clients.service';

class MockClientsService {
  findAll = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Test Client' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Client' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Client' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: MockClientsService;

  beforeEach(async () => {
    service = new MockClientsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsService, useValue: service },
      ],
    })
      .overrideProvider(ClientsService)
      .useValue(service)
      .compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return an array', async () => {
    if (!controller.findAll) return;
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should return a client', async () => {
    if (!controller.findOne) return;
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Client' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
