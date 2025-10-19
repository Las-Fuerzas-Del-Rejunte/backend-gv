import { Public, IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator';
import 'reflect-metadata';

describe('Public Decorator', () => {
  it('should set metadata', () => {
    class Test {}
    Public()(Test);
    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, Test);
    expect(metadata).toBe(true);
  });
});
