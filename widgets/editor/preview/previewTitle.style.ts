import { cva } from 'class-variance-authority';

export const previewTitleVariants = cva('', {
  variants: {
    variant: {
      wedding: 'text-text-wedding',
      firstBirthday: 'text-text-firstbirthday',
      birthday: 'text-text-birthday',
      bridalShower: 'text-text-bridalshower',
      seminar: 'text-text-seminar',
      etc: 'text-black',
    },
  },
  defaultVariants: {
    variant: 'wedding',
  },
});
