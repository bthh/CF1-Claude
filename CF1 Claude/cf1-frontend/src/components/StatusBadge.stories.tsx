import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['success', 'warning', 'error'],
    },
    label: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    label: 'Active',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Pending',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    label: 'Failed',
  },
};

export const LongText: Story = {
  args: {
    variant: 'success',
    label: 'Processing transaction with very long description',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <StatusBadge variant="success" label="Success" />
      <StatusBadge variant="warning" label="Warning" />
      <StatusBadge variant="error" label="Error" />
    </div>
  ),
};

export const ProposalStatuses: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <StatusBadge variant="success" label="" status="Active" />
      <StatusBadge variant="warning" label="" status="Pending" />
      <StatusBadge variant="success" label="" status="Completed" />
      <StatusBadge variant="error" label="" status="Rejected" />
    </div>
  ),
};