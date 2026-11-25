import { resolveInvitationVenue } from './invitationVenue';

const placeBlock = {
  component: 'place',
  props: {
    placeName: '인비아 하우스',
    placeDetail: '3층 그랜드홀',
    placeAddress: '서울 강남구 테헤란로 1',
  },
};

describe('resolveInvitationVenue', () => {
  it('reads the venue from the invitation place block', () => {
    expect(
      resolveInvitationVenue([
        { component: 'greeting', props: { title: '인사말' } },
        placeBlock,
      ])
    ).toEqual({
      name: '인비아 하우스',
      detail: '3층 그랜드홀',
      address: '서울 강남구 테헤란로 1',
      location: '인비아 하우스, 3층 그랜드홀, 서울 강남구 테헤란로 1',
    });
  });

  it('keeps only the parts the author filled in', () => {
    expect(
      resolveInvitationVenue([
        {
          component: 'place',
          props: {
            placeName: '',
            placeDetail: '',
            placeAddress: '부산 해운대구',
          },
        },
      ]).location
    ).toBe('부산 해운대구');
  });

  it('skips empty place blocks and favours the first real venue', () => {
    expect(
      resolveInvitationVenue([
        { component: 'place', props: { placeName: '  ', placeAddress: '' } },
        placeBlock,
        { component: 'place', props: { placeName: '다른 장소' } },
      ]).name
    ).toBe('인비아 하우스');
  });

  it('returns an empty venue when the invitation has none', () => {
    const empty = { name: '', detail: '', address: '', location: '' };
    expect(resolveInvitationVenue(undefined)).toEqual(empty);
    expect(
      resolveInvitationVenue([{ component: 'calendar', props: {} }])
    ).toEqual(empty);
    expect(resolveInvitationVenue([null, 'place', 3])).toEqual(empty);
  });

  it('ignores malformed props instead of throwing', () => {
    expect(
      resolveInvitationVenue([{ component: 'place', props: null }]).location
    ).toBe('');
  });
});
