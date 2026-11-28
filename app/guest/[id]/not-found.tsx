import { GuestAccessNotice } from './components/GuestAccessNotice';

export default function GuestInvitationNotFound() {
  return (
    <GuestAccessNotice
      kind="expired"
      title="초대장을 찾을 수 없어요"
      description="링크가 만료되었거나 주소가 바뀌었을 수 있어요."
    />
  );
}
