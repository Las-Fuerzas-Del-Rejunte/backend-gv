import { Roles, ROLES_KEY } from '../src/common/decorators/roles.decorator';
import 'reflect-metadata';

describe('Roles Decorator', () => {
  it('should set metadata', () => {
    class Test {}
    Roles('admin', 'empleado')(Test);
    const metadata = Reflect.getMetadata(ROLES_KEY, Test);
    expect(metadata).toEqual(['admin', 'empleado']);
  });
});
