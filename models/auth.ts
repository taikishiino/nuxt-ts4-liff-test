import firebase from 'firebase/app';
import { LineProfile } from './line';

export interface AuthState {
  user: firebase.User | null;
  lineProfile: LineProfile | null;
}