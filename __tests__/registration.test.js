import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../src/services/api';
import {toNigerianPhone, isNigerianPhone} from '../src/utilities/format';
import SignUp from '../src/screens/auth/SignUp';
import VerifyRegistration from '../src/screens/auth/VerifyRegistration';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  multiRemove: jest.fn(async () => {}),
}));
jest.mock('../src/config', () => ({API_URL: 'https://api.test/api/v1'}));

const mockNavigation = {navigate: jest.fn(), reset: jest.fn(), goBack: jest.fn()};
let mockRouteParams;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({params: mockRouteParams}),
}));

const mockActions = [];
const mockDispatch = action => {
  if (typeof action === 'function') {
    return action(mockDispatch);
  }
  mockActions.push(action);
  return action;
};
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => ({isAuthenticated: false}),
}));

jest.mock('../src/components/layout/FormLayout', () => ({children, footer}) => (
  <>
    {children}
    {footer}
  </>
));
jest.mock('../src/components/ui/OTPInput', () => 'OTPInput');
jest.mock('../src/components/ui/PhoneField', () => 'PhoneField');
jest.mock('../src/components/ui/PasswordRules', () => ({
  __esModule: true,
  default: 'PasswordRules',
  isStrongPassword: () => true,
  hasEdgeSpace: password => /^\s|\s$/.test(password || ''),
  EDGE_SPACE_ERROR: "Password can't start or end with a space.",
}));
jest.mock('../src/components/ui', () => ({
  AppInput: 'AppInput',
  PasswordInput: 'PasswordInput',
  PrimaryButton: 'PrimaryButton',
}));

const PASSWORD = 'SecurePass123!';
const details = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phoneNumber: '+2348012345678',
  password: PASSWORD,
};
const signedIn = {
  user: {id: 'u1', phone_number: '+2348012345678'},
  wallet: null,
  token: 'access-token',
  refresh_token: 'refresh-token',
};
const needsCode = {verification_required: true, channel: 'email'};

const mockFetch = (status, body) => {
  global.fetch = jest.fn(async () => ({status, ok: status < 400, json: async () => body}));
};

const render = async element => {
  let tree;
  await act(async () => {
    tree = ReactTestRenderer.create(element);
  });
  return tree.root;
};

const allText = root =>
  root
    .findAllByType(Text)
    .map(node => [node.props.children].flat(Infinity).filter(c => typeof c === 'string').join(''))
    .join(' | ');

const findLink = (root, label) =>
  root.findAll(node => node.type === Text && node.props.children === label && !!node.props.onPress)[0];

const fillSignUp = async root => {
  await act(async () => {
    root.findByProps({label: 'First name'}).props.onChangeText('Jane');
    root.findByProps({label: 'Last name'}).props.onChangeText('Doe');
    root.findByProps({label: 'Email address'}).props.onChangeText('jane@example.com');
    root.findByType('PhoneField').props.onChangeText('08012345678');
    root.findByProps({label: 'Password'}).props.onChangeText(PASSWORD);
  });
};

const submit = async root => {
  await act(async () => {
    await root.findByType('PrimaryButton').props.onPress();
  });
};

let logSpy;
beforeEach(() => {
  jest.clearAllMocks();
  mockActions.length = 0;
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  jest.useRealTimers();
  logSpy.mockRestore();
});

const expectPasswordNotLeaked = () => {
  expect(JSON.stringify(logSpy.mock.calls)).not.toContain(PASSWORD);
  expect(JSON.stringify(AsyncStorage.setItem.mock.calls)).not.toContain(PASSWORD);
};

describe('API errors', () => {
  it('reads a FastAPI validation array', async () => {
    mockFetch(422, {
      detail: [
        {
          type: 'value_error',
          loc: ['body', 'phone_number'],
          msg: 'Value error, phone_number must be a +234 number',
          input: PASSWORD,
        },
      ],
    });
    await expect(authAPI.register(details)).rejects.toMatchObject({
      status: 422,
      message: 'phone_number must be a +234 number',
      fieldErrors: {phone_number: 'phone_number must be a +234 number'},
    });
    expectPasswordNotLeaked();
  });

  it('reads a string detail', async () => {
    mockFetch(409, {detail: 'Email already registered'});
    await expect(authAPI.register(details)).rejects.toMatchObject({
      status: 409,
      message: 'Email already registered',
    });
  });

  it('keeps passwords and codes out of the request log', async () => {
    mockFetch(200, {success: true, data: signedIn});
    await authAPI.verifyRegistration({...details, otp: '654321'});
    expectPasswordNotLeaked();
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain('654321');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({password: PASSWORD, otp: '654321'});
  });
});

describe('phone numbers', () => {
  it('accepts the local formats', () => {
    ['08012345678', '2348012345678', '+2348012345678', '+23408012345678', '8012345678', '0801-234 5678'].forEach(
      input => {
        expect(isNigerianPhone(input)).toBe(true);
        expect(toNigerianPhone(input)).toBe('+2348012345678');
      },
    );
  });

  it('rejects other country codes', () => {
    expect(isNigerianPhone('+1 202 555 012')).toBe(false);
  });
});

describe('SignUp', () => {
  it('enters the app on 201, even with a null wallet', async () => {
    mockFetch(201, {success: true, data: signedIn});
    const root = await render(<SignUp />);
    await fillSignUp(root);
    await submit(root);

    expect(JSON.parse(global.fetch.mock.calls[0][1].body).phone_number).toBe('+2348012345678');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'access-token');
    expect(mockActions).toEqual([
      {type: 'AUTH_SUCCESS', payload: {user: signedIn.user, token: 'access-token', userType: 'customer'}},
    ]);
    expectPasswordNotLeaked();
  });

  it('goes to the OTP screen on 202 without saving anything', async () => {
    mockFetch(202, {success: true, data: needsCode});
    const root = await render(<SignUp />);
    await fillSignUp(root);
    await submit(root);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('VerifyRegistration', {details, channel: 'email'});
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockActions).toEqual([]);
  });

  it('offers Log in and Forgot password on 409', async () => {
    mockFetch(409, {detail: 'Email already registered'});
    const root = await render(<SignUp />);
    await fillSignUp(root);
    await submit(root);

    expect(allText(root)).toContain('Email already registered');
    expect(findLink(root, 'Forgot password?')).toBeTruthy();
    await act(async () => findLink(root, 'Log in').props.onPress());
    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'Login', params: {email: 'jane@example.com'}}],
    });
  });

  it('shows a 422 on the phone field', async () => {
    mockFetch(422, {detail: [{loc: ['body', 'phone_number'], msg: 'Value error, phone_number must be a +234 number'}]});
    const root = await render(<SignUp />);
    await fillSignUp(root);
    await submit(root);

    expect(root.findByType('PhoneField').props.error).toBe('Enter a Nigerian number starting with +234.');
  });

  it('blocks a password that starts or ends with a space', async () => {
    const root = await render(<SignUp />);
    await fillSignUp(root);

    for (const password of [`${PASSWORD} `, ` ${PASSWORD}`]) {
      await act(async () => {
        root.findByProps({label: 'Password'}).props.onChangeText(password);
      });
      expect(root.findByType('PrimaryButton').props.disabled).toBe(true);
      expect(root.findByProps({label: 'Password'}).props.error).toBe(
        "Password can't start or end with a space.",
      );
    }

    await act(async () => {
      root.findByProps({label: 'Password'}).props.onChangeText(PASSWORD);
    });
    expect(root.findByType('PrimaryButton').props.disabled).toBe(false);
  });
});

describe('VerifyRegistration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRouteParams = {details, channel: 'email'};
  });

  const enterCode = async (root, code = '123456') => {
    await act(async () => root.findByType('OTPInput').props.onChange(code));
  };
  const tick = async seconds => {
    for (let i = 0; i < seconds; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }
  };

  it('tells the customer where the code went', async () => {
    mockRouteParams = {details, channel: 'phone'};
    const root = await render(<VerifyRegistration />);
    expect(allText(root)).toContain('sent to your phone');
    expect(allText(root)).toContain('+2348012345678');
  });

  it('only accepts a 6-digit code', async () => {
    const root = await render(<VerifyRegistration />);
    await enterCode(root, '12345');
    expect(root.findByType('PrimaryButton').props.disabled).toBe(true);
    await enterCode(root, '123456');
    expect(root.findByType('PrimaryButton').props.disabled).toBe(false);
  });

  it('signs in with the right code', async () => {
    mockFetch(200, {success: true, data: signedIn});
    const root = await render(<VerifyRegistration />);
    await enterCode(root);
    await submit(root);

    expect(global.fetch.mock.calls[0][0]).toBe('https://api.test/api/v1/auth/register/customer/verify');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'access-token');
    expect(mockActions[0].type).toBe('AUTH_SUCCESS');
    expectPasswordNotLeaked();
  });

  it('stays put on a wrong code and can resend after the cooldown', async () => {
    mockFetch(400, {detail: 'Invalid or expired OTP'});
    const root = await render(<VerifyRegistration />);
    await enterCode(root);
    await submit(root);

    expect(allText(root)).toContain('That code is wrong or has expired. Try again or request a new one.');
    expect(mockActions).toEqual([]);
    expect(allText(root)).toContain('Resend in 1:00');
    expect(findLink(root, 'Resend code')).toBeUndefined();

    await tick(60);
    mockFetch(202, {success: true, data: needsCode});
    const resend = root.findAll(node => node.type === Text && node.props.accessibilityRole === 'button')[0];
    await act(async () => {
      await resend.props.onPress();
    });

    expect(global.fetch.mock.calls[0][0]).toBe('https://api.test/api/v1/auth/register/customer');
    expect(allText(root)).toContain('Resend in 1:00');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('offers Log in on a verify 409', async () => {
    mockFetch(409, {detail: 'Account already completed'});
    const root = await render(<VerifyRegistration />);
    await enterCode(root);
    await submit(root);

    expect(allText(root)).toContain('Account already completed');
    expect(findLink(root, 'Log in')).toBeTruthy();
    expect(findLink(root, 'Forgot password?')).toBeUndefined();
  });

  it('handles a resend that comes back 201 or 409', async () => {
    const root = await render(<VerifyRegistration />);
    await tick(60);
    const pressResend = async () => {
      const resend = root.findAll(node => node.type === Text && node.props.accessibilityRole === 'button')[0];
      await act(async () => {
        await resend.props.onPress();
      });
    };

    mockFetch(409, {detail: 'Phone number already registered'});
    await pressResend();
    expect(findLink(root, 'Forgot password?')).toBeTruthy();

    mockFetch(201, {success: true, data: signedIn});
    await pressResend();
    expect(mockActions[0].type).toBe('AUTH_SUCCESS');
  });
});
