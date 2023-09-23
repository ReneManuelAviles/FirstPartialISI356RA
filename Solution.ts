/*Solution

SOLID Principles:
Single Responsibility Principle: La clase LibraryManager se ocupa únicamente de la lógica de la biblioteca, mientras que el servicio EmailService se ocupa del envío de correos electrónicos.
Open/Closed Principle: Las clases están abiertas para extensión (por ejemplo, añadiendo más tipos de notificaciones) pero cerradas para modificación.
Liskov Substitution Principle: User implementa la interfaz IObserver, lo que significa que se puede sustituir por cualquier otro objeto que también implemente la interfaz.
Dependency Inversion Principle: Se inyecta IEmailService en LibraryManager, lo que significa que LibraryManager no depende de una implementación concreta.

Inyección de Dependencias:
Inyectar IEmailService en LibraryManager.

Lambda Expressions:
Usar expresiones lambda en funciones como find y forEach.

Singleton Pattern:
Garantizar que solo haya una instancia de LibraryManager con el método getInstance.

Observer Pattern:
Los usuarios (User) se registran como observadores y son notificados cuando se añade un nuevo libro.

Builder Pattern:
Se utiliza para construir instancias de Book de una manera más limpia y escalable.

Refactorización:
eliminar el uso de ANY mejorar el performance

Aspectos (Opcional)
Puedes anadir logs de info, warning y error en las llamadas, para un mejor control

Diseño por Contrato (Opcional):
Puedes anadir validaciones en precondiciones o postcondiciones como lo veas necesario*/

interface Book {
    title: string;
    author: string;
    ISBN: string;
}

interface Loan {
    ISBN: string;
    userID: string;
    date: Date;
}

interface IEmailService {
    sendEmail(userID: string, message: string): void;
}
class Book {
    constructor(public title: string, public author: string, public ISBN: string) {}
}
class Loan {
    constructor(public ISBN: string, public userID: string, public date: Date) {}
}
class User {
    constructor(private name: string) {}

    update(bookTitle: string) {
        console.log(`${this.name} ha sido notificado sobre el nuevo libro: ${bookTitle}`);
    }
}
class BookBuilder {
    private title: string = '';
    private author: string = '';
    private ISBN: string = '';

    withTitle(title: string): BookBuilder {
        this.title = title;
        return this;
    }

    withAuthor(author: string): BookBuilder {
        this.author = author;
        return this;
    }

    withISBN(ISBN: string): BookBuilder {
        this.ISBN = ISBN;
        return this;
    }

    build(): Book {
        return new Book(this.title, this.author, this.ISBN);
    }
}

class LibraryManager {
    private static instance: LibraryManager;
    private books: Book[] = [];
    private loans: Loan[] = [];
    private emailService: IEmailService;
    private observers: User[] = [];


    constructor(emailService: IEmailService) {
        this.emailService = emailService;
    }
    static getInstance(emailService: IEmailService): LibraryManager {
        if (!LibraryManager.instance) {
            LibraryManager.instance = new LibraryManager(emailService);
        }
        return LibraryManager.instance;
    }
    addObserver(user: User) {
        this.observers.push(user);
    }

    removeObserver(user: User) {
        const index = this.observers.indexOf(user);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    notifyObservers(bookTitle: string) {
        this.observers.forEach(observer => {
            observer.update(bookTitle);
        });
    }


    addBook(title: string, author: string, ISBN: string) {
        // Validación de precondición: Asegurarse de que el ISBN sea único antes de agregar el libro
        if (this.books.some(book => book.ISBN === ISBN)) {
            console.error(`[ERROR] El libro con ISBN ${ISBN} ya existe en la biblioteca.`);
            return;
        }

        const book: Book = { title, author, ISBN };
        this.books.push(book);
        console.log(`[INFO] Libro agregado: ${title} (ISBN: ${ISBN})`);
    }

    removeBook(ISBN: string) {
        const index = this.books.findIndex(b => b.ISBN === ISBN);
        if (index !== -1) {
            const removedBook = this.books.splice(index, 1)[0];
            console.log(`[INFO] Libro eliminado: ${removedBook.title} (ISBN: ${ISBN})`);
        } else {
            console.warn(`[WARNING] Intento de eliminar un libro inexistente con ISBN: ${ISBN}`);
        }
    }

    searchByTitle(title: string) {
        return this.books.filter(book => book.title.includes(title));
    }

    searchByAuthor(author: string) {
        return this.books.filter(book => book.author.includes(author));
    }

    searchByISBN(ISBN: string) {
        return this.books.find(book => book.ISBN === ISBN);
    }

    search(query: string): Book[] {
        const results = this.books.filter(book =>
            book.title.includes(query) ||
            book.author.includes(query) ||
            book.ISBN === query
        );

        if (results.length > 0) {
            console.log(`[INFO] Búsqueda exitosa para "${query}". Resultados encontrados: ${results.length}`);
        } else {
            console.log(`[INFO] Búsqueda para "${query}" no produjo resultados.`);
        }

        return results;
    }

    loanBook(ISBN: string, userID: string) {
        const book = this.books.find(b => b.ISBN === ISBN);
        if (book) {
            const loan: Loan = { ISBN, userID, date: new Date() };
            this.loans.push(loan);
            console.log(`[INFO] Préstamo registrado: ${book.title} a ${userID}`);
            this.sendEmail(userID, `Has solicitado el libro ${book.title}`);
        } else {
            console.warn(`[WARNING] Intento de préstamo de un libro inexistente con ISBN: ${ISBN}`);
        }
    }

    returnBook(ISBN: string, userID: string) {
        const index = this.loans.findIndex(loan => loan.ISBN === ISBN && loan.userID === userID);
        if (index !== -1) {
            const removedLoan = this.loans.splice(index, 1)[0];
            console.log(`[INFO] Devolución registrada: ${removedLoan.date}: Usuario ${userID}, Libro ISBN ${ISBN}`);
            const book = this.books.find(b => b.ISBN === ISBN);
            if (book) {
                this.sendEmail(userID, `Has devuelto el libro con ISBN ${ISBN}. ¡Gracias!`);
            } else {
                console.error(`[ERROR] El libro con ISBN ${ISBN} no se encontró en la biblioteca.`);
            }
        } else {
            console.warn(`[WARNING] Intento de devolución de un libro no prestado: ISBN ${ISBN}, Usuario ${userID}`);
        }
    }

    private sendEmail(userID: string, message: string) {
        console.log(`Enviando email a ${userID}: ${message}`);
    }

    printAllBooks() {
        this.books.forEach(book => {
            console.log(`Título: ${book.title}, Autor: ${book.author}, ISBN: ${book.ISBN}`);
        });
    }

    printAllLoans() {
        this.loans.forEach(loan => {
            console.log(`ISBN: ${loan.ISBN}, Usuario: ${loan.userID}, Fecha: ${loan.date}`);
        });
    }

}
class ConsoleEmailService implements IEmailService {
    sendEmail(userID: string, message: string) {
        console.log(`[INFO] Enviando email a ${userID}: ${message}`);
    }
}

//ostraos rsltados

const book = new BookBuilder()
    .withTitle("El Gran Gatsby")
    .withAuthor("F. Scott Fitzgerald")
    .withISBN("123456789")
    .build();

console.log(book); 

const libraryex = new LibraryManager();
libraryex.addBook("El Gran Gatsby", "F. Scott Fitzgerald", "123456789");
libraryex.addBook("1984", "George Orwell", "123456789");
libraryex.returnBook("987654321", "user01");
libraryex.loanBook("123456789", "user01");
libraryex.returnBook("123456789", "user01");
libraryex.returnBook("123456789", "user01");
libraryex.returnBook("987654321", "user01");