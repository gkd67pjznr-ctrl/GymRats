import React from 'react';
import { render } from '@testing-library/react-native';
import { PresenceIndicator } from '../PresenceIndicator';
import { ReactionsBar } from '../ReactionsBar';

describe('LiveWorkoutTogether Components', () => {
  describe('PresenceIndicator', () => {
    it('should render null when no active users', () => {
      const { queryByText } = render(
        <PresenceIndicator users={[]} />
      );
      expect(queryByText(/working out/)).toBeNull();
    });

    it('should show correct user count', () => {
      const users = [
        { id: '1', name: 'John Doe', isActive: true },
        { id: '2', name: 'Jane Smith', isActive: true },
      ];

      const { getByText } = render(
        <PresenceIndicator users={users} />
      );
      expect(getByText('2 people working out')).toBeTruthy();
    });

    it('should limit visible users based on maxVisible prop', () => {
      const users = [
        { id: '1', name: 'User 1', isActive: true },
        { id: '2', name: 'User 2', isActive: true },
        { id: '3', name: 'User 3', isActive: true },
        { id: '4', name: 'User 4', isActive: true },
      ];

      const { getByText } = render(
        <PresenceIndicator users={users} maxVisible={2} />
      );
      expect(getByText('+2')).toBeTruthy();
    });
  });

  describe('ReactionsBar', () => {
    const mockOnAddReaction = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render without crashing', () => {
      const { toJSON } = render(
        <ReactionsBar
          reactions={[]}
          onAddReaction={mockOnAddReaction}
          currentUserId="test-user"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should show reaction counts', () => {
      const reactions = [
        { id: '1', userId: 'user1', userName: 'User 1', type: 'fire', timestamp: Date.now() },
        { id: '2', userId: 'user2', userName: 'User 2', type: 'fire', timestamp: Date.now() },
        { id: '3', userId: 'user3', userName: 'User 3', type: 'muscle', timestamp: Date.now() },
      ];

      const { getByText } = render(
        <ReactionsBar
          reactions={reactions}
          onAddReaction={mockOnAddReaction}
          currentUserId="test-user"
        />
      );
      expect(getByText('2')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
    });
  });
});