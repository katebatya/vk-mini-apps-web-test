import { FC, useState, SetStateAction } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Button,
  ButtonGroup,
  Group,
  Cell,
  FormItem,
  Input,
  Avatar,
  NavIdProps,
} from '@vkontakte/vkui';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };

  const [imageUrl, setImageUrl] = useState('https://a1ex.ru/cat.png');
  const [imageUrlError, setImageUrlError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  function isUrlValid(url: string) {
    try {
      new URL(url);
      return true;
    }
    catch(e) {}

    return false;
  }

  function validateForm() {
    setImageUrlError('');

    if (!imageUrl.length) {
      setImageUrlError('Укажите ссылку на изображение');
      return false;
    }

    if (!isUrlValid(imageUrl)) {
      setImageUrlError('Укажите верный URL');
      return false;
    }

    return true;
  }

  const onInput = (e: { target: { value: SetStateAction<string>; }; }) => {
    setImageUrl(e.target.value);
    if (!imageUrl.length) {
      setImageUrlError('');
    }
  }

  const onSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    showImage(imageUrl);
  };

  const onClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    shareImage(imageUrl);
  };

  //bridge.subscribe((e) => console.log(e));

  async function showImage(imageUrl: string) {
    setDisabled(true);
    setLoading(true);
    bridge.send('VKWebAppShowImages', {images: [imageUrl]})
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        setImageUrlError('Не удалось открыть изображения');
        console.log(error);
      })
      .finally(() => {
        setDisabled(false);
        setLoading(false);
      });
  }

  async function shareImage(link: string) {
    setDisabled(true);
    setLoading(true);
    bridge.send('VKWebAppShowWallPostBox', {message: "Look at this, it's cat on watermelon!", upload_attachments: [{type: 'photo', link: link}]})
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setDisabled(false);
        setLoading(false);
      });
  }

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>
      {fetchedUser && (
        <Group header={<Header mode="secondary">User Data Fetched with VK Bridge</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group>
        <form onSubmit={onSubmit}>
          <FormItem
            htmlFor="image"
            top="Ссылка на изображение"
            status={!imageUrlError ? 'default' : 'error'}
            bottom={imageUrlError}
            bottomId="image-type"
          >
            <Input
              aria-labelledby="image-type"
              id="image"
              type="text"
              name="image"
              value={imageUrl}
              onKeyUp={onInput}
              onKeyDown={onInput}
              onChange={onInput}
            />
          </FormItem>
          <FormItem>
            <ButtonGroup mode="horizontal" gap="m" stretched>
              <Button type="submit" size="l" stretched disabled={disabled} loading={loading} appearance="positive">
                Открыть изображение
              </Button>
              <Button type="button" size="l" stretched disabled={disabled} loading={loading} onClick={onClick} appearance="accent">
                Поделиться изображением
              </Button>
            </ButtonGroup>
          </FormItem>
        </form>
      </Group>
    </Panel>
  );
};
