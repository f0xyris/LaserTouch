# Исправления диалогов удаления для курсов и услуг

## ✅ **Что было исправлено:**

### 1. Заменены простые `window.confirm` на красивые диалоги

**Было:**

```typescript
const handleDeleteService = async (id: number) => {
  if (!window.confirm(t.deleteConfirm || "Delete procedure?")) return;
  // ... код удаления
};
```

**Стало:**

```typescript
const handleDeleteService = async (id: number) => {
  setSavingId(`delete-${id}`);
  // ... код удаления
  setSavingId(null);
  setOpenDeleteServiceDialogId(null);
};
```

### 2. Добавлены состояния для диалогов

```typescript
// Состояния для диалогов удаления
const [openDeleteCourseDialogId, setOpenDeleteCourseDialogId] = useState<
  number | null
>(null);
const [openDeleteServiceDialogId, setOpenDeleteServiceDialogId] = useState<
  number | null
>(null);
```

### 3. Созданы красивые AlertDialog компоненты

#### Для курсов:

```tsx
<AlertDialog
  open={openDeleteCourseDialogId === course.id}
  onOpenChange={(open) => setOpenDeleteCourseDialogId(open ? course.id : null)}
>
  <AlertDialogTrigger asChild>
    <Button size="icon" variant="secondary" title={t.delete || "Delete"}>
      <Trash2 className="w-4 h-4" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>{t.deleteCourse || "Delete Course"}</AlertDialogTitle>
    <AlertDialogDescription>
      {t.deleteCourseConfirm ||
        "Are you sure you want to delete this course? This action cannot be undone."}
    </AlertDialogDescription>
    <div className="flex justify-end gap-2 mt-4">
      <AlertDialogCancel asChild>
        <Button variant="secondary">{t.cancel || "Cancel"}</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive">{t.delete || "Delete"}</Button>
      </AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

#### Для услуг:

```tsx
<AlertDialog
  open={openDeleteServiceDialogId === service.id}
  onOpenChange={(open) =>
    setOpenDeleteServiceDialogId(open ? service.id : null)
  }
>
  <AlertDialogTrigger asChild>
    <Button size="icon" variant="secondary" title={t.delete || "Delete"}>
      <Trash2 className="w-4 h-4" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>{t.deleteService || "Delete Service"}</AlertDialogTitle>
    <AlertDialogDescription>
      {t.deleteServiceConfirm ||
        "Are you sure you want to delete this service? This action cannot be undone."}
    </AlertDialogDescription>
    <div className="flex justify-end gap-2 mt-4">
      <AlertDialogCancel asChild>
        <Button variant="secondary">{t.cancel || "Cancel"}</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button variant="destructive">{t.delete || "Delete"}</Button>
      </AlertDialogAction>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

### 4. Исправлены ошибки типизации

- Заменены `undefined` на `null` для `setSavingId`
- Добавлены типы для параметров функций
- Исправлены типы состояний

### 5. Добавлены переводы на все языки

#### Английский (en):

```typescript
deleteCourse: "Delete Course",
deleteCourseConfirm: "Are you sure you want to delete this course? This action cannot be undone.",
deleteService: "Delete Service",
deleteServiceConfirm: "Are you sure you want to delete this service? This action cannot be undone."
```

#### Польский (pl):

```typescript
deleteCourse: "Usuń Kurs",
deleteCourseConfirm: "Czy na pewno chcesz usunąć ten kurs? Tej akcji nie można cofnąć.",
deleteService: "Usuń Usługę",
deleteServiceConfirm: "Czy na pewno chcesz usunąć tę usługę? Tej akcji nie można cofnąć."
```

#### Украинский (uk):

```typescript
deleteCourse: "Видалити Курс",
deleteCourseConfirm: "Ви впевнені, що хочете видалити цей курс? Цю дію не можна скасувати.",
deleteService: "Видалити Послугу",
deleteServiceConfirm: "Ви впевнені, що хочете видалити цю послугу? Цю дію не можна скасувати."
```

## 🎨 **Преимущества новых диалогов:**

1. **Красивый дизайн** - соответствуют общему стилю приложения
2. **Лучший UX** - модальные окна вместо браузерных confirm
3. **Консистентность** - такой же стиль как у удаления отзывов
4. **Доступность** - правильная семантика и ARIA атрибуты
5. **Анимации** - плавные переходы и эффекты
6. **Мультиязычность** - поддержка всех языков приложения

## 🔧 **Технические детали:**

### Используемые компоненты:

- `AlertDialog` - основной контейнер
- `AlertDialogTrigger` - кнопка для открытия
- `AlertDialogContent` - содержимое диалога
- `AlertDialogTitle` - заголовок
- `AlertDialogDescription` - описание
- `AlertDialogCancel` - кнопка отмены
- `AlertDialogAction` - кнопка действия

### Состояния:

- `openDeleteCourseDialogId` - ID курса для удаления
- `openDeleteServiceDialogId` - ID услуги для удаления
- `savingId` - ID элемента в процессе сохранения/удаления

## 🧪 **Тестирование:**

1. **Откройте админку:** `http://localhost:5000/admin`
2. **Перейдите на вкладку "Prices"**
3. **Найдите курс или услугу**
4. **Нажмите кнопку удаления (корзина)**
5. **Должен появиться красивый диалог**
6. **Проверьте кнопки "Cancel" и "Delete"**
7. **Проверьте переводы на разных языках**

## 📝 **Переводы:**

Добавлены новые ключи для переводов во всех языках:

### Ключи:

- `deleteCourse` - заголовок диалога удаления курса
- `deleteCourseConfirm` - текст подтверждения удаления курса
- `deleteService` - заголовок диалога удаления услуги
- `deleteServiceConfirm` - текст подтверждения удаления услуги

### Языки:

- 🇺🇸 **English** - полная поддержка
- 🇵🇱 **Polski** - полная поддержка
- 🇺🇦 **Українська** - полная поддержка

## ✅ **Результат:**

Теперь удаление курсов и услуг происходит через красивые модальные диалоги, которые:

- Соответствуют дизайну приложения
- Имеют правильную семантику
- Поддерживают анимации
- Обеспечивают лучший пользовательский опыт
- Полностью переведены на все языки приложения
- Консистентны с остальными диалогами в системе
