
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from '../src/modules/clients/clients.service';

class MockClientsRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue({ id: '1', name: 'Test Client' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Client' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Client' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockClientsRepository;

  beforeEach(async () => {
    repository = new MockClientsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: 'ClientsRepository', useValue: repository },
      ],
    })
      .overrideProvider(ClientsService)
      .useFactory({
        factory: () => new ClientsService(repository as any),
      })
      .compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('findOne should return a client', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Client' });
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('create should return created client', async () => {
    const payload = { name: 'Created Client' };
    const result = await service.create(payload as any);
    expect(result).toEqual({ id: '1', name: 'Created Client' });
    expect(repository.create).toHaveBeenCalledWith(payload);
  });

  it('update should return updated client', async () => {
    const payload = { name: 'Updated Client' };
    const result = await service.update('1', payload as any);
    expect(result).toEqual({ id: '1', name: 'Updated Client' });
    expect(repository.update).toHaveBeenCalledWith('1', payload);
  });

  it('remove should resolve', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith('1');
  });
});
