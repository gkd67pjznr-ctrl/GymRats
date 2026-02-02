// src/ui/components/Hangout/__tests__/FriendAvatar.test.tsx
// Unit tests for FriendAvatar component

import React from 'react';
import { render } from '@testing-library/react-native';
import { FriendAvatar } from '../FriendAvatar';
import { useHangoutStore } from '../../../../lib/hangout/hangoutStore';
import { useUser } from '../../../../lib/stores/authStore';
import { useFriendEdges } from '../../../../lib/stores/friendsStore';

// Mock stores and dependencies
jest.mock('../../../../lib/hangout/hangoutStore');
jest.mock('../../../../lib/stores/authStore');
jest.mock('../../../../lib/stores/friendsStore');

// Mock AvatarView to avoid dependencies
jest.mock('../../Avatar/AvatarView', () => ({
  AvatarView: 'AvatarView',
}));

describe('FriendAvatar', () => {
  const mockUser = {
    id: 'current-user',
    displayName: 'Current User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockFriendEdge = {
    userId: 'current-user',
    otherUserId: 'friend-user',
    status: 'friends' as const,
    updatedAtMs: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue(mockUser);
    (useFriendEdges as jest.Mock).mockReturnValue([mockFriendEdge]);
  });

  it('should render correctly with online presence', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend Name"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with working_out status', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'working_out' as const,
      activity: 'Bench pressing',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend Name"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with resting status', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'resting' as const,
      activity: 'Resting',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend Name"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render current user with "You" label', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'current-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="current-user"
        displayName="Current User"
        presence={mockPresence}
        isCurrentUser
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render friend indicator for friends', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend Name"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should not render friend indicator for non-friends', () => {
    (useFriendEdges as jest.Mock).mockReturnValue([]);

    const mockPresence = {
      id: 'presence-1',
      userId: 'stranger-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="stranger-user"
        displayName="Stranger"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with offline status', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'offline' as const,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend Name"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle missing displayName gracefully', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should handle missing avatarUrl gracefully', () => {
    const mockPresence = {
      id: 'presence-1',
      userId: 'friend-user',
      roomId: 'room-123',
      status: 'online' as const,
      activity: 'Available',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };

    const { toJSON } = render(
      <FriendAvatar
        userId="friend-user"
        displayName="Friend"
        presence={mockPresence}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  describe('status badges', () => {
    it('should show Online badge for online status', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'friend-user',
        roomId: 'room-123',
        status: 'online' as const,
        activity: 'Available',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      const { toJSON } = render(
        <FriendAvatar
          userId="friend-user"
          displayName="Friend"
          presence={mockPresence}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should show Working Out badge for working_out status', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'friend-user',
        roomId: 'room-123',
        status: 'working_out' as const,
        activity: 'Bench pressing',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      const { toJSON } = render(
        <FriendAvatar
          userId="friend-user"
          displayName="Friend"
          presence={mockPresence}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should show Resting badge for resting status', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'friend-user',
        roomId: 'room-123',
        status: 'resting' as const,
        activity: 'Resting',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      const { toJSON } = render(
        <FriendAvatar
          userId="friend-user"
          displayName="Friend"
          presence={mockPresence}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should show Offline badge for offline status', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'friend-user',
        roomId: 'room-123',
        status: 'offline' as const,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      const { toJSON } = render(
        <FriendAvatar
          userId="friend-user"
          displayName="Friend"
          presence={mockPresence}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
