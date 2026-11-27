/** @jest-environment node */

jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn(),
  },
}));

import { Redis } from '@upstash/redis';
import { getRetiredAudienceSlug } from './audienceLinkStore';

const originalEnv = process.env;

describe('getRetiredAudienceSlug', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it.each(['null', 'false', 'true'])('preserves the literal slug %s', async raw => {
    const redis = {
      hget: jest.fn().mockImplementation(async () => {
        const options = (Redis.fromEnv as jest.Mock).mock.calls[0]?.[0];
        return options?.automaticDeserialization === false
          ? raw
          : JSON.parse(raw);
      }),
    };
    (Redis.fromEnv as jest.Mock).mockReturnValue(redis);

    await expect(getRetiredAudienceSlug('root-data', 'folder')).resolves.toBe(
      raw
    );

    expect(Redis.fromEnv).toHaveBeenCalledWith({
      automaticDeserialization: false,
    });
    expect(redis.hget).toHaveBeenCalledWith(
      'audience:links:{root-data}',
      'retired-folder:folder'
    );
  });
});
