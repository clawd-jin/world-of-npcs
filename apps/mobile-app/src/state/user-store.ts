// User State placeholder
// TODO: Implement user state management

export interface UserState {
  id: string | null;
  username: string;
  email: string;
  balance: number;
  isLoading: boolean;
}

export const initialUserState: UserState = {
  id: null,
  username: '',
  email: '',
  balance: 0,
  isLoading: false,
};

export const userReducer = (state: UserState, action: any): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    case 'LOGOUT':
      return initialUserState;
    default:
      return state;
  }
};
