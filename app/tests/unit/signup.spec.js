import { mount } from '@vue/test-utils';
import Signup from '@/views/user/Signup';

describe('Signup.vue', () => {
    it('renders three input fields', async () => {
        const wrapper = mount(Signup);
        const loginLabel = wrapper.find('.form-control[type="text"] label');
        const loginInput = wrapper.find('input[type="text"]');
        const emailLabel = wrapper.find('.form-control[type="email"] label');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordLabel = wrapper.find('.form-control[type="password"] label');
        const passwordInput = wrapper.find('input[type="password"]');

        expect(loginLabel.text()).toBe('Имя пользователя');
        expect(emailLabel.text()).toBe('Email');
        expect(passwordLabel.text()).toBe('Пароль');

        const [login, email, pwd] = ['zotov', '1@1.ru', 'qwerty'];
        
        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);

        expect(loginInput.element.value).toBe(login);
        expect(emailInput.element.value).toBe(email);
        expect(passwordInput.element.value).toBe(pwd);
    });

    it('renders error for empty name', async () => {
        const wrapper = mount(Signup);
        const loginInput = wrapper.find('input[type="text"]');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordInput = wrapper.find('input[type="password"]');

        const [login, email, pwd] = ['', '1@1.ru', 'qwerty'];

        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);
        await wrapper.find('button').trigger('click');

        const loginErrorMessage = wrapper.find('.form-control[type="text"] .form-error-message');
        expect(loginErrorMessage.text()).toBe('Поле не может быть пустым');
    });

    it('renders error for empty email', async () => {
        const wrapper = mount(Signup);
        const loginInput = wrapper.find('input[type="text"]');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordInput = wrapper.find('input[type="password"]');

        const [login, email, pwd] = ['zotov', '', 'qwerty'];

        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);
        await wrapper.find('button').trigger('click');

        const emailErrorMessage = wrapper.find('.form-control[type="email"] .form-error-message');
        expect(emailErrorMessage.text()).toBe('Поле не может быть пустым');
    });

    it('renders error for incorrect email', async () => {
        const wrapper = mount(Signup);
        const loginInput = wrapper.find('input[type="text"]');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordInput = wrapper.find('input[type="password"]');

        const [login, email, pwd] = ['zotov', '123', 'qwerty'];

        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);
        await wrapper.find('button').trigger('click');

        const loginErrorMessage = wrapper.find('.form-control[type="email"] .form-error-message');
        expect(loginErrorMessage.text()).toBe('Некорректный адрес электронной почты');
    });

    it('renders error for empty password', async () => {
        const wrapper = mount(Signup);
        const loginInput = wrapper.find('input[type="text"]');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordInput = wrapper.find('input[type="password"]');

        const [login, email, pwd] = ['zotov', '1@1.ru', ''];

        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);
        await wrapper.find('button').trigger('click');

        const passwordErrorMessage = wrapper.find('.form-control[type="password"] .form-error-message');
        expect(passwordErrorMessage.text()).toBe('Поле не может быть пустым');
    });

    it('renders error for short password', async () => {
        const wrapper = mount(Signup);
        const loginInput = wrapper.find('input[type="text"]');
        const emailInput = wrapper.find('input[type="email"]');
        const passwordInput = wrapper.find('input[type="password"]');

        const [login, email, pwd] = ['zotov', '1@1.ru', '123'];

        await loginInput.setValue(login);
        await emailInput.setValue(email);
        await passwordInput.setValue(pwd);
        await wrapper.find('button').trigger('click');

        const passwordErrorMessage = wrapper.find('.form-control[type="password"] .form-error-message');
        expect(passwordErrorMessage.text()).toBe('Пароль должен быть не короче 5 символов');
    });
});
