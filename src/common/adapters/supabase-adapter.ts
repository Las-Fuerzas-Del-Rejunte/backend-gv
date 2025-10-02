export interface SupabaseAdapter<RecordType, DomainType, CreateDto, UpdateDto> {
  toDomain(record: RecordType): DomainType;
  toRecord(payload: Partial<CreateDto | UpdateDto>): Partial<RecordType>;
}
