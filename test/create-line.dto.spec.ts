import "reflect-metadata";
import { CreateLineDto } from 'src/modules/lines/dto/create-line.dto';
import { UpdateLineDto } from 'src/modules/lines/dto/update-line.dto';
import { validate } from 'class-validator';

describe('CreateLineDto', () => {
  it('should be defined', () => {
    expect(new CreateLineDto()).toBeDefined();
  });
});

describe('UpdateLineDto', () => {
  it('should be defined', () => {
    expect(new UpdateLineDto()).toBeDefined();
  });
});
