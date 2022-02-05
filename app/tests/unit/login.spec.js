import { mount } from '@vue/test-utils';
import Login from '@/views/user/Login';

describe('Login.vue', () => {
  it('renders two input fields', async () => {
    const wrapper = mount(Login);
    const emailLabel = wrapper.find('.form-control[type="email"] label');
    const emailInput = wrapper.find('input[type="email"]');
    const passwordLabel = wrapper.find('.form-control[type="password"] label');
    const passwordInput = wrapper.find('input[type="password"]');

    expect(emailLabel.text()).toBe('Email');
    expect(passwordLabel.text()).toBe('Пароль');

    const [email, pwd] = ['1@1.ru', 'qwerty'];

    await emailInput.setValue(email);
    await passwordInput.setValue(pwd);

    expect(emailInput.element.value).toBe(email);
    expect(passwordInput.element.value).toBe(pwd);
  });

  it('renders error for empty email', async () => {
    const wrapper = mount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    const [email, pwd] = ['', 'qwerty'];

    await emailInput.setValue(email);
    await passwordInput.setValue(pwd);
    await wrapper.find('button').trigger('click');

    const emailErrorMessage = wrapper.find('.form-control[type="email"] .form-error-message');
    expect(emailErrorMessage.text()).toBe('Поле не может быть пустым');
  });

  it('renders error for incorrect email', async () => {
    const wrapper = mount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    const [email, pwd] = ['123', 'qwerty'];

    await emailInput.setValue(email);
    await passwordInput.setValue(pwd);
    await wrapper.find('button').trigger('click');

    const emailErrorMessage = wrapper.find('.form-control[type="email"] .form-error-message');
    expect(emailErrorMessage.text()).toBe('Некорректный адрес электронной почты');
  });

  it('renders error for empty password', async () => {
    const wrapper = mount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    const [email, pwd] = ['1@1.ru', ''];

    await emailInput.setValue(email);
    await passwordInput.setValue(pwd);
    await wrapper.find('button').trigger('click');

    const passwordErrorMessage = wrapper.find('.form-control[type="password"] .form-error-message');
    expect(passwordErrorMessage.text()).toBe('Поле не может быть пустым');
  });

  it('renders error for short password', async () => {
    const wrapper = mount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    const [email, pwd] = ['1@1.ru', '123'];

    await emailInput.setValue(email);
    await passwordInput.setValue(pwd);
    await wrapper.find('button').trigger('click');

    const passwordErrorMessage = wrapper.find('.form-control[type="password"] .form-error-message');
    expect(passwordErrorMessage.text()).toBe('Пароль должен быть не короче 5 символов');
  });
});
