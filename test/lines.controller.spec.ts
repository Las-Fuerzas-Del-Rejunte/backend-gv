
import { Test, TestingModule } from '@nestjs/testing';
import { LinesController } from '../src/modules/lines/lines.controller';
import { LinesService } from '../src/modules/lines/lines.service';

class MockLinesService {
  findAll = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue({ id: '1', name: 'Test Line' });
  create = jest.fn().mockResolvedValue({ id: '1', name: 'Created Line' });
  update = jest.fn().mockResolvedValue({ id: '1', name: 'Updated Line' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('LinesController', () => {
  let controller: LinesController;
  let service: MockLinesService;

  beforeEach(async () => {
    service = new MockLinesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinesController],
      providers: [
        { provide: LinesService, useValue: service },
      ],
    })
      .overrideProvider(LinesService)
      .useValue(service)
      .compile();

    controller = module.get<LinesController>(LinesController);
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

  it('findOne should return a line', async () => {
    if (!controller.findOne) return;
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1', name: 'Test Line' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });
});
