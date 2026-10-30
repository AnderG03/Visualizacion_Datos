library(ggplot2)

# Cambiar directorio de trabajo
setwd("C:/Users/PC/Documents/MASTER/Visualización de datos/PEC 2/Visualizacion_Datos/Scatter Plot")

# Abrir archivo csv en la tabla bank
flights<-read.csv("Clean_Dataset.csv", sep=",",na.strings = "NA") #Separador de columnas ";"
                                                                   #Valores vacios = 'NA'

# Seleccionar solo los vuelos sin escalas y clase business
bus_no_stops <- flights[flights$stops == 'zero' & flights$class == 'Business' & flights$airline == 'Vistara', ]

# Muestra aleatoria en lugar de los primeros 500
set.seed(123)
bus_no_stops <- bus_no_stops[sample(nrow(bus_no_stops), 500), ]

ggplot(bus_no_stops, aes(x = duration, y = price)) +
  geom_point(alpha = 0.4, size = 2, colour = "steelblue") +
  geom_smooth(method = "lm", colour = "red", fill = "pink") +
  scale_y_continuous(labels = scales::comma) +
  labs(x = "Duración (horas)", y = "Precio (INR)",
       title = "Relación entre duración y precio del vuelo") +
  theme_bw()
