import { apiErrorMessage } from './client';
import axios from 'axios';

describe('apiErrorMessage', () => {
  it('returns fallback for non-axios errors', () => {
    expect(apiErrorMessage(new Error('boom'), 'FB')).toBe('FB');
  });
  it('falls back safely', () => {
    expect(apiErrorMessage(null)).toBe('Something went wrong');
    expect(apiErrorMessage(undefined, 'FB')).toBe('FB');
  });
  it('extracts backend message from real axios error', () => {
    const axiosErr = {
      isAxiosError: true,
      message: 'Request failed',
      response: { data: { error: { message: 'Invalid credentials' } } },
    } as unknown as Error;
    expect(axios.isAxiosError(axiosErr)).toBe(true);
    expect(apiErrorMessage(axiosErr)).toBe('Invalid credentials');
  });
});
