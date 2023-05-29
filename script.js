let cart = [] 
let modalQt = 1      // quantidade de pizzas no pop-up
let modalKey = 0

const C = (el) => {          // simplificação do document querySelector
    return document.querySelector(el)
} 
const CS = (el) => {         // simplificação do document querySelectorAll
    return document.querySelectorAll(el)
}

// Listagem das pizzas
pizzaJson.map( (item, index) => {
    let pizzaItem = C(".models .pizza-item").cloneNode(true)       // cloneNode clona o item. o true define se ele vai clonar o interior desse item também ou não

    pizzaItem.setAttribute("data-key", index)      // id do item
    pizzaItem.querySelector(".pizza-item--img img").src = item.img
    pizzaItem.querySelector(".pizza-item--name").innerHTML = item.name   // pega e exibe o nome da pizza
    pizzaItem.querySelector(".pizza-item--price").innerHTML = `R$ ${item.price.toFixed(2)}`
    pizzaItem.querySelector(".pizza-item--desc").innerHTML = item.description

    pizzaItem.querySelector("a").addEventListener("click", (event) => {
        event.preventDefault()           // inibe o evento original do elemento
        let key = event.target.closest(".pizza-item").getAttribute("data-key")        // no evento do click no target ele pega o data-key (id do item)
        modalQt = 1
        modalKey = key   // qual é a pizza?

        C(".pizzaBig img").src = pizzaJson[key].img                 // exibe as informações da pizza clicada no modal (pop-up)
        C(".pizzaInfo h1").innerHTML = pizzaJson[key].name
        C(".pizzaInfo--desc").innerHTML = pizzaJson[key].description 
        C(".pizzaInfo--actualPrice").innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`
        C(".pizzaInfo--size.selected").classList.remove("selected")           // pega o item que possui as 2 classes citadas, acessa a lista de classes e remove a determinada (reseta o selected do tamanho)

        CS(".pizzaInfo--size").forEach((size, sizeIndex) => {     // para cada item presente no query selector all daquele elemento, execute X função
            if (sizeIndex == 2) {                  // define para que o botão selecionado ja esteja sempre setado na pizza grande
                size.classList.add("selected")
            } 
            size.querySelector("span").innerHTML =  pizzaJson[key].sizes[sizeIndex]      // acessa o tamanho das pizzas na ordem
        })

        C(".pizzaInfo--qt").innerHTML = modalQt

        C(".pizzaWindowArea").style.opacity = 0
        C(".pizzaWindowArea").style.display = "flex"     // muda o display de none pra flex
        setTimeout(() => {                               // animação de abrir o pop-up do modal (pop-up)
            C(".pizzaWindowArea").style.opacity = 1
        }, 200)    // 200ms
    })

    C(".pizza-area").append(pizzaItem)
} )

// Eventos/interatividade do modal (pop-up)
function closeModal() {
    C(".pizzaWindowArea").style.opacity = 0
    setTimeout( () => {
        C(".pizzaWindowArea").style.display = "none"
    }, 500)  
}
CS(".pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton").forEach( (item) => {        // observa os itens e executa a função ao clicar em cancelar/voltar
    item.addEventListener("click", closeModal)
} )

C(".pizzaInfo--qtmenos").addEventListener("click", () => {
    if(modalQt > 1) {          // check pra negar quantidade de 0 itens e abaixo
        modalQt--
        C(".pizzaInfo--qt").innerHTML = modalQt   // atualiza a nova informação de quantidade
    }
})
C(".pizzaInfo--qtmais").addEventListener("click", () => {
    modalQt++
    C(".pizzaInfo--qt").innerHTML = modalQt   // atualiza a nova informação acima
})

CS(".pizzaInfo--size").forEach((size, sizeIndex) => {     // para cada item presente no query selector all daquele elemento, execute X função
    size.addEventListener("click", (e) => {
        C(".pizzaInfo--size.selected").classList.remove("selected")       // como se fosse um checkbox, somente uma das opções pode ser selecionada
        size.classList.add("selected")
    })  
})

C(".pizzaInfo--addButton").addEventListener("click", () => {
    let size = parseInt(C(".pizzaInfo--size.selected").getAttribute("data-key"))   // data-key = info do tamanho da pizza

    let identifier = pizzaJson[modalKey].id+"&"+size  // cria um identificador pro ID e tamanho da pizza, pra fazer a junção posterior no carrinho
    let key = cart.findIndex( (item) => {    // procura o index e verifica se são iguais
        return item.identifier == identifier    // o == indica uma condição, não uma mudança de valor como seria com um = apenas
    })
    if (key > -1) {    // se o novo item adicionado for igual um já existente no carrinho do mesmo tipo, some ao invés de adicionar um novo
        cart[key].qt += modalQt
    } else {
        cart.push({
            identifier,
            id:pizzaJson[modalKey].id,
            size:size,
            qt:modalQt
        })
    }

    updateCart()
    closeModal()
})

C(".menu-openner").addEventListener("click", () => {
    if (cart.length > 0) {            // abre o carrinho do mobile se houver ao menos 1 item. (no CSS, o carrinho ja ta na tela mas oculto com left 100vw)
        C("aside").style.left = "0"
    }
})
C(".menu-closer").addEventListener("click", () => {    // interação do botão de fechar o carrinho
    C("aside").style.left = "100vw"
})

function updateCart() {       
    C(".menu-openner span").innerHTML = cart.length   // quantidade de itens no carrinho do mobile

    if(cart.length > 0) {                  // verifica se o carrinho possui itens, se possuir abre o carrinho (class show do CSS)
        C("aside").classList.add("show")
        C(".cart").innerHTML = ""        // zera o carrinho antes de dar update, o que resolve um bug de itens duplicados

        let subtotal = 0
        let discount = 0
        let total = 0

        for(let i in cart) {
            let pizzaItem = pizzaJson.find( (item) => {
                return item.id == cart[i].id        // atenção no == pra fazer a busca, e não a substituição de valor
            })
            subtotal+= pizzaItem.price * cart[i].qt  // aumenta no subtotal o tipo da pizza * a quantidade
            let cartItem = C(".models .cart--item").cloneNode(true)      // clona o cart template

            let pizzaSizeName
            switch(cart[i].size) {         // Adiciona a informação do tamanho como P, M e G a partir do size do pizzaJson, pra que não fique 0, 1 e 2
                case 0:
                    pizzaSizeName = "P"
                    break
                 case 1:
                    pizzaSizeName = "M"
                     break
                 case 2:
                    pizzaSizeName = "G"
                    break
            }
            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`

            cartItem.querySelector("img").src = pizzaItem.img          // adição das informações; foto, descrição, etc
            cartItem.querySelector(".cart--item-nome").innerHTML = pizzaName
            cartItem.querySelector(".cart--item--qt").innerHTML = cart[i].qt
            cartItem.querySelector(".cart--item-qtmenos").addEventListener("click", () => {
                if (cart[i].qt > 1) {   // garante que o total de itens não seja menor do que 0. se for 0, fecha o carrinho e remove o item
                    cart[i].qt--
                } else {
                    cart.splice(i, 1)     // splice remove UM item i do array cart
                }
                updateCart()
            })
            cartItem.querySelector(".cart--item-qtmais").addEventListener("click", () => {
                cart[i].qt++
                updateCart()
            })

            C(".cart").append(cartItem)
        }

        discount = subtotal * 0.1   // aplica o desconto dos 10%
        total = subtotal - discount

        C(".subtotal span:last-child").innerHTML = `R$ ${subtotal.toFixed(2)}`   // adiciona as informações de valor
        C(".desconto span:last-child").innerHTML = `R$ ${discount.toFixed(2)}`
        C(".total span:last-child").innerHTML = `R$ ${total.toFixed(2)}`

    } else {
        C("aside").classList.remove("show")
        C("aside").style.left = "100vw"        // oculta o carrinho (mobile)
    }
}